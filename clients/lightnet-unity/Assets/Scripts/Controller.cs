using UnityEngine;
using System.Collections;
using System.Net.Sockets;
using System.IO;
using System.Threading;
using System;
using System.Net;

public class Controller : MonoBehaviour {
	public UnityEngine.UI.Text StatusElement;

	public string targetAddress = "192.168.178.24";
	public string handlerID = "unknown";
	public int numberOfLeds = 256;

	TcpListener listener;
	string statustext;

	float lastBroadcast = 0;
	float broadcastIntervall = 3f;

	void Start () {
		statustext = StatusElement.text;
			
		listener = new TcpListener(IPAddress.Any, 3636);
		listener.Start();
		Debug.Log ("Server mounted, listening to port 3636");

		Thread t = new Thread(new ThreadStart(TCPServer));
		t.Start();

		if (PlayerPrefs.HasKey ("ClientIP")) {
			targetAddress = PlayerPrefs.GetString ("ClientIP");
		}
		if (PlayerPrefs.HasKey ("NumberOfLeds")) {
			numberOfLeds = PlayerPrefs.GetInt ("NumberOfLeds");
		}
	}

	void Update () {
		StatusElement.text = statustext;

		if ((Time.time - lastBroadcast) > broadcastIntervall) {
			SendBroadcast ();
			lastBroadcast = Time.time;
		}

		if (targetAddress != PlayerPrefs.GetString ("ClientIP")) {
			PlayerPrefs.SetString ("ClientIP", targetAddress);
			PlayerPrefs.SetInt ("NumberOfLeds", numberOfLeds);
		}
	}

	public void SendBroadcast() {
		Debug.Log ("Sending Broadcast...");

		var udpClient = new UdpClient();
		var data = System.Text.Encoding.ASCII.GetBytes ("lightnet:" + Network.player.ipAddress);

		udpClient.BeginSend (data, data.Length, new IPEndPoint (IPAddress.Parse ("224.0.0.1"), 3535), new AsyncCallback (this.onBroadcastSend), null);
	}

	private void onBroadcastSend(IAsyncResult result) {
		Debug.Log ("Broadcast sent.");
	}


	private void TCPServer() {
		while (true) {
			Socket sock = listener.AcceptSocket ();
			Debug.Log("Client responded.");

			try {
				Stream stream = new NetworkStream (sock);
				StreamReader reader = new StreamReader(stream);
				StreamWriter writer = new StreamWriter(stream);
				writer.AutoFlush = true;

				string data = reader.ReadLine();
				Debug.Log("RECV '" + data + "'");
				ParseRegistration(data);

				writer.WriteLine("LDTP 200 OK");

				stream.Close ();
			} catch(Exception ex) {
				Debug.LogError (ex.Message);
			}

			sock.Close ();
		}
	}

	void ParseRegistration (string data)
	{
		var dataParts = data.Split (';');
		targetAddress = dataParts [0];
		handlerID = dataParts [1];
		numberOfLeds = int.Parse(dataParts [2]);

		statustext = "Client at " + targetAddress;
	}

	public void TurnAllLightsOn() {
		this.SetAllLights (Color.white);
	}

	public void TurnAllLightsOff() {
		this.SetAllLights (Color.black);
	}

	public void AllTheColors() {
		var colors = new Color[numberOfLeds];
		for (var i = 0; i < numberOfLeds; i++) {
			colors [i] = WheelColor (i);
		}
		SendColorMessage (CreateMessageBlob (colors));
	}

	private Color[] CreateColorList(Color c) {
		Color[] result = new Color[numberOfLeds];
		for (var i = 0; i < numberOfLeds; i++) {
			result [i] = c;
		}
		return result;
	}

	public void SetAllLights(Color c) {
		SendColorMessage (CreateMessageBlob (CreateColorList (c)));
	}

	private byte[] CreateMessageBlob(Color[] data) {
		byte[] result = new byte[numberOfLeds*3];
		for (int i=0, n=0; i < numberOfLeds; i++) {
			result [n + 0] = (byte)(data [i].g * 255);
			result [n + 1] = (byte)(data [i].r * 255);
			result [n + 2] = (byte)(data [i].b * 255);
			n += 3;
		}
		return result;
	}

	private void SendColorMessage(byte[] data) {
		Debug.Log ("Sending Color data to " + targetAddress);
		statustext = "Sending Color data";

		var udpClient = new UdpClient();

		udpClient.BeginSend (data, data.Length, new IPEndPoint (IPAddress.Parse (targetAddress), 2525), new AsyncCallback (this.onColorDatatSend), null);
	}

	private void onColorDatatSend(IAsyncResult result) {
		Debug.Log ("Color data sent.");
		statustext = "Color data sent";
	}

	private Color WheelColor(int wheelPos) {
		wheelPos = 255 - wheelPos;
		if (wheelPos < 85) {
			return GetColor(255 - wheelPos * 3, 0, wheelPos * 3);
		}

		if (wheelPos < 170) {
			wheelPos -= 85;
			return GetColor(0, wheelPos * 3, 255 - wheelPos * 3);
		}

		wheelPos -= 170;
		return GetColor((wheelPos * 3), 255 - wheelPos * 3, 0);
	}

	private Color GetColor(int r, int g, int b) {
		return new Color(r/355f, g/255f, b/255f);
	}
}

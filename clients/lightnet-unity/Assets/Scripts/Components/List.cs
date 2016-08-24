using UnityEngine;
using System;
using System.Collections;

public class List : MonoBehaviour
{
	private System.Collections.ArrayList elements = new ArrayList();
	public Transform ContentContainer;
	public GameObject ItemPrefab;

	public void OnScrollChange(Vector2 direction) {

	}

	public void AddElement(object obj) {
		this.elements.Add (obj);
		var gameObject = (GameObject)Instantiate (ItemPrefab);
		gameObject.transform.SetParent (ContentContainer);
	}
}

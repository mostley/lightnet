__ESP__ = True

from handler import Server

try:
    import machine
except:
    print("Failed to import hardware packages, switching to no ESP mode")
    __ESP__ = False

class Main:
    def __init__(self):
        self.server = Server()


    def run(self):
        print("Running (after " + str(machine.reset_cause()) + ")")

        if machine.reset_cause() != machine.SOFT_RESET:
            self.server.start()
        else:
            print("server not started on soft reset")

main = Main()
main.run()

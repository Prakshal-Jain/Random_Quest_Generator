package Server

import java.io.FileWriter

import scala.io
import java.io.FileWriter

import scala.util.Random
import akka.actor.Actor
import com.corundumstudio.socketio.listener.DataListener
import com.corundumstudio.socketio.{AckRequest, Configuration, SocketIOClient, SocketIOServer}
import play.api.libs.json.{JsValue, Json}

class server(){
  var l:List[String] = List()
  var user:String = ""
  var lines2: List[String] = List()
  var question_Map:Map[String,JsValue] = Map("Incomplete" -> Json.toJson(l), "Completed" -> Json.toJson(l), "time_set" -> Json.toJson("20"))
  var buffer: String = ""

  val config: Configuration = new Configuration {
    setHostname("localhost")
    setPort(8080)
  }
  val server: SocketIOServer = new SocketIOServer(config)
  server.addEventListener("receive_question", classOf[String], new receiver(this))
  server.addEventListener("show_question", classOf[Nothing], new show_questions(this))
  server.addEventListener("edit", classOf[Nothing], new edit(this))
  server.addEventListener("pop_row", classOf[Int], new pop(this))
  server.addEventListener("clr", classOf[Nothing], new clr(this))
  server.addEventListener("timer", classOf[String], new timer(this))
  server.addEventListener("new_user", classOf[String], new user(this))
  server.start()

  class receiver(server: server) extends DataListener[String] {
    override def onData(socket: SocketIOClient, question: String, ackRequest: AckRequest): Unit = {
      if(question == "") {

      }
      else{
        val primary:JsValue = Json.toJson(question_Map("Incomplete").as[List[String]] :+ question)
        question_Map = question_Map.updated("Incomplete",primary)
        val writer1 = new FileWriter(user)
        writer1.write(Json.stringify(Json.toJson(question_Map)))
        writer1.close()
      }
    }
  }

  class show_questions(server: server) extends DataListener[Nothing]{
    override def onData(socket: SocketIOClient, question: Nothing, ackRequest: AckRequest): Unit = {
      val q = question_Map("time_set").as[String]
      socket.sendEvent("show_quest",thr().toString)
      socket.sendEvent("rec_time",q)
    }
  }

  class timer(server: server) extends DataListener[String]{
    override def onData(socket: SocketIOClient, time: String, ackRequest: AckRequest): Unit = {
      question_Map = question_Map.updated("time_set",Json.toJson(time))
      val writer5 = new FileWriter(user)
      writer5.write(Json.stringify(Json.toJson(question_Map)))
      writer5.close()
    }
  }


  class clr(server: server) extends DataListener[Nothing]{
    override def onData(socket: SocketIOClient, cler: Nothing, ackRequest: AckRequest): Unit = {
      question_Map = Map("Incomplete" -> Json.toJson(l), "Completed" -> Json.toJson(l), "time_set" -> Json.toJson("20"))
      val writer3 = new FileWriter(user)
      writer3.write(Json.stringify(Json.toJson(question_Map)))
      writer3.close()
    }
  }

  class edit(server: server) extends DataListener[Nothing]{
    override def onData(socket: SocketIOClient, question: Nothing, ackRequest: AckRequest): Unit = {
      var s:String = ""
      val all_q_lis:List[String] = question_Map("Incomplete").as[List[String]]
      for(e <- all_q_lis){
        s += (e + "(_question-break_)")
      }
      socket.sendEvent("edit_q",s)
    }
  }


  def thr():String = {
    var buffer: String = io.Source.fromFile(user).mkString
    val parsed = Json.parse(buffer)
    val p2 = parsed.as[Map[String,JsValue]]
    var incomplete = p2("Incomplete").as[List[String]]
    var complete = p2("Completed").as[List[String]]
    var time:JsValue = p2("time_set")
    val r: Random.type = scala.util.Random
    val new_lis = r.shuffle(incomplete)
    var h = "Please enter questions first..."
    if(new_lis.nonEmpty){
      h = new_lis.head
    }
    if(h == "Please enter questions first..."){

    }
    else{
      complete = complete :+ h
    }
    val selected_index = incomplete.indexOf(h)
    incomplete = incomplete.slice(0,selected_index) ++ incomplete.slice(selected_index+1,incomplete.length)

    val writer2 = new FileWriter(user)
    var sendable:String = Json.stringify(Json.toJson(Map("Incomplete" -> Json.toJson(incomplete), "Completed" -> Json.toJson(complete), "time_set" -> time)))
    writer2.write(sendable)
    writer2.close()
    h
  }

  class pop(server: server) extends DataListener[Int]{
    override def onData(socket: SocketIOClient, pop_index: Int, ackRequest: AckRequest): Unit = {
      var all_q_lis:List[String] = question_Map("Incomplete").as[List[String]]
      all_q_lis = (all_q_lis.slice(0,pop_index) ++ all_q_lis.slice(pop_index+1,all_q_lis.length))
      question_Map = question_Map.updated("Incomplete",Json.toJson(all_q_lis))
      val writer4 = new FileWriter(user)
      writer4.write(Json.stringify(Json.toJson(question_Map)))
      writer4.close()
    }
  }

  def code_generator(): String ={
    val r: Random.type = scala.util.Random
    val s = f"${('A' to 'Z')(r.nextInt(26))}${r.nextInt(10000)}%04d"
    if(lines2.contains(s)){
      code_generator()
    }
    else{
      s
    }
  }

  class user(server: server) extends DataListener[String]{
    override def onData(socket: SocketIOClient, username: String, ackRequest: AckRequest): Unit = {
      var u = username
      if(username == ""){
        u = code_generator()
        socket.sendEvent("default_username",u)
      }
      val bufferedSource = io.Source.fromFile("src/Functionality/all_users.txt")
      lines2 = (for (line <- bufferedSource.getLines()) yield line).toList
      bufferedSource.close
      question_Map = Map("Incomplete" -> Json.toJson(l), "Completed" -> Json.toJson(l), "time_set" -> Json.toJson("20"))

      user = "src/Functionality/" + u + ".json"
      if(lines2.contains(u)){

      }
      else{
        lines2 = lines2 :+ u
      }
      val writer3 = new FileWriter("src/Functionality/all_users.txt")
      var s = ""
      for(e <- lines2){
        s += (e + "\n")
      }
      writer3.write(s)
      writer3.close()

      val writer4 = new FileWriter(user)
      writer4.write(Json.stringify(Json.toJson(question_Map)))
      writer4.close()
      buffer = io.Source.fromFile(user).mkString
      if(buffer.nonEmpty){
        var parsed = Json.parse(buffer)
        question_Map = parsed.as[Map[String,JsValue]].filterNot(_==null)
      }
    }
  }

}

object OfficeServer {
  def main(args: Array[String]): Unit = {
    new server()
  }
}
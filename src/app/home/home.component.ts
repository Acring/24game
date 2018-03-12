import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from '../socket-service/socket.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit , OnDestroy{
  ngOnDestroy(): void {

  }

  username: string = "";
  subscribe: EventEmitter<any> ;
  constructor(private socket: SocketService, private router: Router) { }

  ngOnInit() {
    this.subscribe = this.socket.getEventListener().subscribe(event => {
      if(event.type == "message") {

        console.log(event.data);
        console.log("开始匹配");
        this.router.navigate(['/room'])

      }
      if(event.type == "close") {
        console.log("已断开连接")
      }
      if(event.type == "open") {
        console.log("已建立连接")
      }
    });
  }

  tryLogin(){
    if(this.username.trim() == ""){
      alert("用户名不能为空");
      return;
    }
    let data = {
      type: 'match',
      data:{
        username: this.username
      }
    };
    this.socket.send(data);
  }
}

import { Component, OnInit } from '@angular/core';
import {SocketService} from '../socket-service/socket.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})

/**
 * 匹配房间 包括匹配中, 匹配成功, 对战界面等
 */
export class RoomComponent implements OnInit {

  myName: string; // 自己的名字
  oppoName: string; // 对手的名字
  myScore: number = 0;  // 自己的分数
  oppoScore:number = 0;  // 对手的分数
  round: 1;  // 游戏轮次
  limitTime: number = 0; // 时间限制

  statusList: string[] = ["matching", 'matched','playing', 'win', 'lose', 'timeout', 'over'];
  status: string = "matching";  // 初始化为匹配中

  numClass: string[] = ['num btn btn-success', 'num btn btn-success active'];
  opClass : string[] = ['op btn btn-success', 'op'];



  numList: number[];
  tempNumList: number[];

  activeNum: number = -1;  // 当前点中的数字
  activeOp: number = -1;  // 当前点中的操作符
  hiddenNum: number[] = [];  // 被隐藏的按钮

  constructor( private socketService: SocketService,
                private router: Router) { }

  ngOnInit() {
    this.socketService.getEventListener().subscribe(event =>{
      switch (event.data.type){
        case 'matched':
          console.log('matched');
          this.onMatched(event.data);
          break;
        case 'stopmatch':
          console.log('退出匹配');
          this.router.navigate(['/dot24']);
          break;
        case 'matchresult':
          console.log('回合结束');
          this.onMatchResult(event.data);
          break;
        case 'matchOver':
          this.onMatchOver();
      }
      }
    )
  }

  onMatchOver(){
    this.status = this.statusList[6];

    setTimeout(()=>{
      this.router.navigate(['/dot24']);
    }, 2000)
  }


  onMatchResult(data){
    switch (data['data']['win']){
      case 1:
        this.onWin();
        break;
      case 0:
        this.onLose();
        break;
      case -1:
        this.onTimeout();
        break;
    }
    this.round = data['data']['question']['round'];
    this.limitTime = data['data']['question']['time'];
    this.numList = data['data']['question']['info'];
    this.tempNumList = JSON.parse(JSON.stringify(this.numList));
    this.hiddenNum = [];
  }

  onWin(){  // 回合获胜
    this.myScore += 1;
    this.status = this.statusList[3];

    setTimeout(()=>{
      this.status = this.statusList[2]
    }, 2000);
  }

  onLose(){  // 回合战败
    this.oppoScore += 1;
    this.status = this.statusList[4];

    setTimeout(()=>{
      this.status = this.statusList[2];
    }, 2000);
  }

  /**
   * 回合超时, 重置时间和题目
   */
  onTimeout(){
    this.status = this.statusList[5];

    setTimeout(()=>{
      this.status = this.statusList[2];
    }, 2000)
  }
  onMatched(data){  // 匹配成功
    console.log('onMatched', data);

    this.status = this.statusList['1'];
    this.oppoName = data['data']['opponentname'];

    this.numList = data['data']['question']['info'];
    this.round = data['data']['question']['round'];
    this.tempNumList = JSON.parse(JSON.stringify(this.numList));
    this.limitTime = data['data']['question']['time'];

    setTimeout(()=>{  // 2s后过渡到play界面
      this.status = this.statusList[2];
      setInterval(()=>this.timer(), 1000);
    }, 2000)
  }

  timer(){
    if(this.limitTime > 0){
      this.limitTime -= 1;
    }
  }

  onStopMatch(){  // 停止匹配
    let frame = {
      type: "stopmatch",
      data:{

      }
    };
    this.socketService.send(frame);
  }

  onClickNum(index){  // 点击数字
    if(this.activeNum == index){
      return;
    }
    if(this.activeNum != -1 && this.activeOp != -1){  // 之前点击数字且有操作符则则进行计算
      switch (this.activeOp){
        case 0:
          this.tempNumList[index] = this.tempNumList[this.activeNum] + this.tempNumList[index];
          break;
        case 1:
          this.tempNumList[index] = this.tempNumList[this.activeNum] - this.tempNumList[index];
          break;
        case 2:
          this.tempNumList[index] = this.tempNumList[this.activeNum] * this.tempNumList[index];
          break;
        case 3:
          this.tempNumList[index] = this.tempNumList[this.activeNum] / this.tempNumList[index];
          break;
      }

      this.hiddenNum.push(this.activeNum);
      this.activeNum = index;
      this.activeOp = -1;

      if(this.hiddenNum.length == 3 && this.tempNumList.indexOf(24) != -1){  // 运算3次且计算结果中有24则说明计算出了答案
        this.onSubmitResult();
      }
    }else{  // 没有数字或者没有操作符, 不计算
      this.activeNum = index;
    }
  }

  onClickOp(index){  // 点击操作符
    this.activeOp = index;
  }

  onClickRedo(){  // 点击重置
    this.tempNumList = JSON.parse(JSON.stringify(this.numList));
    this.activeOp = -1;
    this.activeNum = -1;
    this.hiddenNum = [];
  }

  onSubmitResult(){ // 提交正确答案
    let data = {
      type: 'matchresult',
      data:{
        round: this.round,
        rpn: []  // 预留,用来检测客户端是否真的计算出了答案
      }
    };

    this.socketService.send(data);
  }

  onLeave(){  // 离开对战
    let data = {
      type: 'matchOver'
    };

    this.socketService.send(data);
  }

}

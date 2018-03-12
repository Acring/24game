import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {RoomComponent} from './room/room.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dot24',
    pathMatch: 'full'
  },
  {
    path:'dot24',
    component: HomeComponent
  },
  {
    path: 'room',
    component: RoomComponent
  }


];

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';


export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdTDGZ55bbwwZq9hXImeCyF5T5mnTivq0",
    authDomain: "soundmix-7ea5c.firebaseapp.com",
    databaseURL: "https://soundmix-7ea5c.firebaseio.com",
    projectId: "soundmix-7ea5c",
    storageBucket: "soundmix-7ea5c.appspot.com",
    messagingSenderId: "1053135115888"
  };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

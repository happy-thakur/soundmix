import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';


import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseApp } from 'angularfire2';
import 'firebase/storage';

declare var audioContext: any;
declare var audioContext2: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  playing: boolean = false;
  allList: any;
  audioOne: any;
  audioTwo: any;
  left: object = {
    "no": 0,
    url: ""
  }
  right: object = {
    "no": 1,
    url: ""
  }

  show: object = {
    left: false,
    right: false
  };  

  play: object = {
    one: true,
    two: true
  };

  constructor(private db: AngularFireDatabase, private http: Http, private firebase: FirebaseApp) {

  }

  ngOnInit() {
    console.log("init");
    // this.songInit();
    this.getAllSound();
  }



  getAllSound() {
    // getting the sound...
    let url = "/sound";
    this.db.object(url).subscribe((data) => {
      console.log(data);
      if(data) {
        this.allList = data;
        // get all the media tokens..
        this.downloadURL(data[0]['name']).then((url2: string) => {
          this.left['url'] = url2;
          this.allList[0]['url'] = url2;
          this.left['data'] = this.allList[0];
        }, (err) => console.log(err));

         this.downloadURL(data[1]['name']).then((url2: string) => {
          this.right['url'] = url2;
          this.allList[1]['url'] = url2;
          this.right['data'] = this.allList[1];
          // this.downloadURL(this.allList[1]['name']);
        }, (err) => console.log(err));

        // now for all..
        this.allList.forEach((element, i) => {
          if(!element['url']) {
            // get the url..
            this.downloadURL(element['name']).then((link: string) => {
              this.allList[i]['url'] = link;
            });
          }
        });
      }
    });

  }

  // donwlaod url
  downloadURL(file) {
    console.log(file);
    return this.firebase.storage().ref('/drum/'+file).getDownloadURL();
  }


  // this is to change the song..
  changeSong(str, i , data) {
    if(str == 'right') {
      this.audioTwo.source.playSound.stop(0);
      this.right['no'] = i;
      this.right['url'] = data['url'];
      this.right['data'] = data;
      this.fileInit(this.right['data']['name'], audioContext2).then((data) => {
      this.audioTwo = data['playFile']();
      })
    } else if(str == 'left') {
      this.audioOne.source.playSound.stop(0);      
      this.left['no'] = i;
      this.left['url'] = data['url'];
      this.left['data'] = data;
      this.fileInit(this.left['data']['name'], audioContext).then((data) => {
        this.audioOne = data['playFile']();        
      })
    }
  }

  // getting sound url..
  // getSoundURL(data) {
  //   return new Promise((resolve, reject) => {
  //     let preURL = "https://firebasestorage.googleapis.com/v0/b/soundmix-7ea5c.appspot.com/o/";
  //     // now get the urll..
  //     let sub = this.getRequest(preURL+'drum%2F'+data['name']).subscribe((data) => {
  //       if(data) {
  //         let url = preURL+data['name']+'?alt=media&token='+data['downloadTokens'];
  //         resolve(encodeURI(url));
  //       }
  //     },
  //   (err) => reject(err),
  //   () => sub.unsubscribe());
  //   });
  // }

  // get request..
  getRequest (url) {
    return this.http.get(url).map((data: any) => {
      return data.json();
    }).catch((err: any) => {
      return Observable.throw(err || "Server Error");
    })
  }

  playIt(){
    if(!this.playing) {
      this.playing = true;
      if(this.left && this.left['data']['name'] && this.right && this.right['data']['name'])
        this.songInit(this.left['data']['name'], this.right['data']['name']);
      else 
        console.log("plwase wait..");
    }
  }

  songInit(url, url2) {

    this.fileInit(url, audioContext).then((data) => {
      console.log(data);
      if(data) {
        // this.playFile(1);
        // this.audioOne = data;
        this.fileInit(url2, audioContext2).then((data2) => {
          console.log(data2);
          this.audioTwo = data2;
          // now play both..
          // this.audioOne.source.play(1);
          this.audioOne = data['playFile']();
          this.audioTwo = data2['playFile']();
          console.log(this.audioOne);
          console.log(this.audioTwo);
          this.crossfade(50);
        });
      } 
    });
  }

  // file init
  fileInit(filename, audioCont) {
      return new Promise((resolve, reject) => {
        let allObj = {};
        let host = window.location.origin;
        let   soundObj = {
          soundToPlay: "",
          volume: {},
          playSound: {}
        };
        var getSound = new XMLHttpRequest();
        getSound.open("GET", host+'/assets/drum/'+filename, true);
        getSound.setRequestHeader('Access-Control-Allow-Headers', '*');
        getSound.responseType = "arraybuffer";
        getSound.onload = () => {
            console.log("data");
            console.log(getSound.response);
            audioCont.decodeAudioData(getSound.response, (buffer) => {
                soundObj.soundToPlay = buffer;
                // soundObj.play(1);
                allObj['done'] = 'done';
                allObj['obj'] = soundObj;
                // allObj['playFile'] = this.playFile;
                resolve(allObj);
            });
        }
        getSound.send();

        // ----------------------------------------------------
        ///   PLAY FILE
        
        allObj['playFile'] = (volumeVal = 1) => {
          let tempVol: any;
          soundObj.volume = audioCont.createGain ? audioCont.createGain() : audioCont.createGainNode();
          tempVol = soundObj.volume;
          tempVol.gain.value = volumeVal;
          soundObj.volume = tempVol;
          
          // soundObj.playSound = audioCont.createBufferSource();
          let playsound = audioCont.createBufferSource();
          // let filter = audioCont.createBiquadFilter();
          playsound.buffer = soundObj.soundToPlay;
          playsound.loop = true;
          playsound.connect(soundObj.volume);
          // soundObj['filter'] = filter;
          // tempVol.connect(filter);
          tempVol.connect(audioCont.destination);
          playsound.start(audioCont.currentTime)
          soundObj.playSound = playsound;
          return {
              source: soundObj,
              gainNode: soundObj.volume
          };
        }


        //  PLAY FILE ENDS
        // -----------------------------------------------------

        // -----------------------------------------------------
        //  FADING EFFECT..

        allObj['crossFade'] = (element) => {
           var x = parseInt(element) / 100;
          // console.log(x);
          // console.log(ctl1);
          // console.log(ctl2);
          // Use an equal-power crossfading curve:
          if (this.audioOne && this.audioTwo) {
              var gain1 = Math.cos(x * 0.5 * Math.PI);
              var gain2 = Math.cos((1.0 - x) * 0.5 * Math.PI);
              console.log(gain1);
              console.log(gain2);
              this.audioOne.playObj.gainNode.gain.value = gain1;
              this.audioTwo.playObj.gainNode.gain.value = gain2;
          } else {
              console.log("all empty");
          }
        }

        //    FADING ENDS..
        // --------------------------------------------------------
        
    });
  }

  //  stop
  toggle(str) {
    if(str == 'one') {
      console.log(this.audioOne.source['playSound']);
      if(this.play['one']) {
        audioContext.suspend().then(() => console.log("paused"));
        this.play['one'] = false;
      } else {
        audioContext.resume().then(() => console.log("played"));        
        this.play['one'] = true;
      }
    } else if(str == 'two') {
      if(this.play['two']) {
        audioContext2.suspend().then(() => console.log("paused"));        
        this.play['two'] = false;      
      } else {
        audioContext2.resume().then(() => console.log("played"));             
        this.play['two'] = true;   
      }
    }
  }

  playNow(str) {
    if(str == 'one' && !this.play['one']) {
      this.audioOne.source['playSound'].start(0);
      this.play['one'] = true;
    } else if(str == 'two' && !this.play['two']) {
      this.audioTwo.source['playSound'].start(0);      
      this.play['two'] = true;      
    }     
  }

  // filter to audio
  filterIt(str) {

    this.audioOne.source['filter']['type'] = str;
    this.audioOne.source['filter']['frequency']['value'] = 500;
    console.log(this.audioOne.source);
  }


  // play the file..
  // playFile(volumeVal = 1) {
  //       let tempVol: any;
  //       this.soundObj.volume = audioContext.createGain ? audioContext.createGain() : audioContext.createGainNode();
  //       tempVol = this.soundObj.volume;
  //       tempVol.gain.value = volumeVal;
  //       this.soundObj.volume = tempVol;
        
  //       // this.soundObj.playSound = audioContext.createBufferSource();
  //       let playsound = audioContext.createBufferSource();
  //       playsound.buffer = this.soundObj.soundToPlay;
  //       playsound.connect(this.soundObj.volume);
  //       tempVol.connect(audioContext.destination)
  //       playsound.start(audioContext.currentTime)
  //       this.soundObj.playSound = playsound;
  //       return {
  //           source: this.soundObj,
  //           gainNode: this.soundObj.volume
  //       };
  //   }

    // fading effect 
    crossfade(element) {
      var x = parseInt(element) / 100;
      // console.log(x);
      // console.log(ctl1);
      // console.log(ctl2);
      // Use an equal-power crossfading curve:
      if (this.audioOne && this.audioTwo) {
          var gain1 = Math.cos(x * 0.5 * Math.PI);
          var gain2 = Math.cos((1.0 - x) * 0.5 * Math.PI);
          console.log(this.audioOne.gainNode.gain);
          console.log(this.audioTwo.gainNode.gain);
          this.audioOne.gainNode.gain.value = gain1;
          this.audioTwo.gainNode.gain.value = gain2;
      } else {
          console.log("all empty");
      }
  }
}

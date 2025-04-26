window.onload = () => {
  const userData = {
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  document.getElementById('userData').textContent = JSON.stringify(userData, null, 2);

  const timeEl = document.getElementById("timePhone");
  if (timeEl) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeEl.textContent = `${hours}:${minutes}`;
  } else {
      console.error("Елемент з id='timePhone' не знайдено!");
  }

  addStatusElements();
};
function checkSpeakers(audioId, btn) {
    const audio = document.getElementById(audioId);
    if (!audio) {
        console.error(`Аудіо з id="${audioId}" не знайдено!`);
        return;
    }

    audio.play()
        .then(() => {
            btn.querySelector('span').textContent = `⏸`;
        })
        .catch((err) => {
            btn.querySelector('span').textContent = ``;
            console.error(err);
        });
}

// 🎙️ Мікрофон
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
function startRecording() {
    const button = document.querySelector('#voice button');

    if (!isRecording) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) {
                        audioChunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'fromMe';
                    messageDiv.style.background = 'none';
                    messageDiv.style.border = 'none';
                    messageDiv.style.width = '300px';

                    const audioEl = document.createElement('audio');
                    audioEl.controls = true;
                    audioEl.src = audioUrl;

                    messageDiv.appendChild(audioEl);
                    document.getElementById('message').appendChild(messageDiv);

                    messageDiv.scrollIntoView({ behavior: 'smooth' });
                };

                mediaRecorder.start();
                isRecording = true;
                button.classList.add('recording');
            })
            .catch(err => {
                console.error('Мікрофон не працює:', err);
            });
    } else {
        mediaRecorder.stop();
        isRecording = false;
        button.classList.remove('recording');
    }
}
function toggleAudio( audioId) {
    const audio = document.getElementById(audioId);
    const allAudio = document.querySelectorAll("audio");
    const durationElement = document.getElementById("duration" + audioId.charAt(audioId.length - 1));

    allAudio.forEach(a => {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
      }
    });

    allBtns.forEach(b => b.textContent = "▶");

    if (audio.paused) {
      audio.play();
      btn.textContent = "⏸";
    } else {
      audio.pause();
      btn.textContent = "▶";
    }

    audio.onended = () => {
      btn.textContent = "▶";
    }
 }

 const msgContainer = document.getElementById("message");
 msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });

//  camera

let videoRecorder;
let videoStream;
let videoChunks = [];
let isVideoRecording = false;

function toggleVideoRecording() {
  const video = document.getElementById("circle-video");
  const container = document.getElementById("circle-recording");
  const timeDisplay = document.getElementById("recording-time");

  if (!isVideoRecording) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoStream = stream;
        video.srcObject = stream;
        container.classList.remove("recording-hidden");

        videoRecorder = new MediaRecorder(stream);
        videoChunks = [];
        isVideoRecording = true;
        const timer = setInterval(() => {
          seconds++;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);

        videoRecorder.ondataavailable = e => {
          if (e.data.size > 0) {
            videoChunks.push(e.data);
          }
        };
        videoRecorder.onstop = () => {
          clearInterval(timer);
          container.classList.add("recording-hidden");

          const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);

          const message = document.createElement("div");
          message.className = "fromMe";
          const videoEl = document.createElement("video");
          videoEl.src = videoUrl;
          videoEl.controls = true;
          videoEl.style.width = '250px';
          videoEl.style.height = '250px';
          videoEl.style.objectFit = 'cover';
          videoEl.style.borderRadius = '10%';
          videoEl.style.margin = '5px 5px 5px 0';

          message.style.background = 'none';
          message.style.border = 'none';
          message.style.display = 'block';
          message.appendChild(videoEl);
          document.getElementById("message").appendChild(message);
          message.scrollIntoView({ behavior: "smooth" });

          videoStream.getTracks().forEach(track => track.stop());
          isVideoRecording = false;
        };

        videoRecorder.start();
      });
  } else {
    videoRecorder.stop();
  }
}


// geo
function checkGeolocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const newGeo = document.createElement("p");
          newGeo.className = "fromMe";
          newGeo.innerHTML = `Моє місцезнаходження: <br> Широта: ${latitude}, <br> Довгота: ${longitude}`;

          document.getElementById("message").appendChild(newGeo);
          document.getElementById("message").scrollTop = document.getElementById("message").scrollHeight;
      });
  }
}



const input = document.getElementById('search');
const messageContainer = document.getElementById('message');
input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    sendMessage(input.value);
    input.value = '';
  }
});

function sendMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'fromMe';
  msg.innerHTML = `<p>${text}</p>`;
  messageContainer.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth' });
}

// перевірка клави
document.addEventListener('keydown', (event) => {
  const msg = document.createElement('div');
  msg.className = 'fromMe';
  msg.innerHTML = `<p>🔤 Натиснута клавіша: <strong>${event.key}</strong></p>`;
  document.getElementById('message').appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth' });
});

// перевірка мишки

document.addEventListener('mousedown', (event) => {
  const buttonMap = ['Ліва кнопка', 'Середня кнопка', 'Права кнопка'];
  const msg = document.createElement('div');
  msg.className = 'fromMe';
  msg.style.background = '#737272';
  msg.style.border = 'none';
  msg.style.height = '35px';

  msg.innerHTML = `<p>🖱️ Натиснута мишка: <strong>${buttonMap[event.button] || 'Інша кнопка'}</strong></p>`;
  document.getElementById('message').appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth' });
});
function addStatusElements() {
  const messageContainer = document.getElementById('message');

  const videoElement = document.createElement('video');
  videoElement.id = 'videoPreview';
  videoElement.autoplay = true;
  videoElement.style.display = 'none';

  const geoStatusElement = document.createElement('p');
  geoStatusElement.id = 'geo-status';
  geoStatusElement.className = 'fromMe';


  const micStatusElement = document.createElement('input');
  micStatusElement.id = 'mic-status';
  micStatusElement.setAttribute('readonly', true);
  micStatusElement.style.border = 'none';
  micStatusElement.style.background = 'none';
  micStatusElement.style.width = '130px';

  messageContainer.appendChild(videoElement);
  messageContainer.appendChild(geoStatusElement);
  messageContainer.appendChild(micStatusElement);

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function startCircleRecording(stream) {
  const video = document.getElementById("circle-video");
  const container = document.getElementById("circle-recording");
  const timeDisplay = document.getElementById("recording-time");

  video.srcObject = stream;
  container.classList.remove("recording-hidden");

  let seconds = 0;
  const interval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    container.classList.add("recording-hidden");
    stream.getTracks().forEach(track => track.stop());
  }, 10000); 
}


function sendFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
      console.log(e.target.result);
  };
  reader.readAsDataURL(file); 
}
document.querySelector('input[type="file"]').addEventListener('change', sendFile);


const fileInput = document.getElementById('fileInput');
const sendBtn = document.getElementById('images');
const chat = document.getElementById('message');
sendBtn.addEventListener('click', () => {
  fileInput.click();
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const result = e.target.result;
    const message = document.createElement('div');
    message.className = 'fromMe';

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = result;
      img.alt = file.name;
      message.appendChild(img);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = result;
      video.controls = true;
      message.appendChild(video);
    } else {
      const text = document.createElement('p');
      text.textContent = `📎 ${file.name}`;
      message.appendChild(text);
    }

    chat.appendChild(message);
    fileInput.value = ''; 
  };
  reader.readAsDataURL(file);
});
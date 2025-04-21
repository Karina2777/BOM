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
    const button = document.querySelector('#voise button');
    const micStatus = document.getElementById('mic-status');

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
                    messageDiv.style.background = 'none'
                    messageDiv.style.border = 'none'
                    messageDiv.style.width = ' 300px'

                    const audioEl = document.createElement('audio');
                    audioEl.controls = true;
                    audioEl.src = audioUrl;

                    messageDiv.appendChild(audioEl);
                    document.getElementById('message').appendChild(messageDiv);

                    micStatus.value = '';
                    messageDiv.scrollIntoView({ behavior: 'smooth' });
                };

                mediaRecorder.start();
                isRecording = true;
                micStatus.value = '🎙️ Йде запис...';
            })
            .catch(err => {
                console.error('Мікрофон не працює:', err);
                micStatus.value = '❌ Помилка мікрофона';
            });
    } else {
        mediaRecorder.stop();
        isRecording = false;
        button.textContent = '🎙️';
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

// //  camera

let videoRecorder;
let videoStream;
let videoChunks = [];
let isVideoRecording = false;

function toggleVideoRecording() {
  const status = document.getElementById('video-status');
  const preview = document.getElementById('videoPreview');

  if (!isVideoRecording) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoStream = stream;
        preview.srcObject = stream;
        preview.style.display = 'block';

        videoRecorder = new MediaRecorder(stream);
        videoChunks = [];

        videoRecorder.ondataavailable = e => {
          if (e.data.size > 0) {
            videoChunks.push(e.data);
          }
        };

        videoRecorder.onstop = () => {
          const blob = new Blob(videoChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const messageDiv = document.createElement('div');
          messageDiv.className = 'fromMe';
          messageDiv.style.background = 'none'
          messageDiv.style.border = 'none'
          messageDiv.style.width = ' 270px'
          messageDiv.style.height = ' 270px'

          const videoEl = document.createElement('video');
          videoEl.src = url;
          videoEl.controls = true;
          videoEl.className = 'circular-video';
          videoEl.setAttribute('playsinline', '');
          videoEl.setAttribute('muted', '');

          messageDiv.appendChild(videoEl);
          document.getElementById('message').appendChild(messageDiv);

          preview.style.display = 'none';
          preview.srcObject = null;
          videoStream.getTracks().forEach(track => track.stop());

          status.textContent = '';
          messageDiv.scrollIntoView({ behavior: 'smooth' });
        };

        videoRecorder.start();
        isVideoRecording = true;
        status.textContent = '';
      })
      .catch(err => {
        status.textContent = '';
        console.error(err);
      });
  } else {
    videoRecorder.stop();
    isVideoRecording = false;
    status.textContent = '';
  }
}


function checkGeolocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Створення нового повідомлення
          const newGeo = document.createElement("p");
          newGeo.className = "fromMe";
          newGeo.innerHTML = `<a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank">Моє місцезнаходження</a>`;

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
  msg.innerHTML = `<p>🖱️ Натиснута мишка: <strong>${buttonMap[event.button] || 'Інша кнопка'}</strong></p>`;
  document.getElementById('message').appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth' });
});
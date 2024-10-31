![image](https://github.com/user-attachments/assets/8cd76588-4f3f-4079-8c4a-8166f0e41700)
This is a fun event website called NIGHT SKY HUNT. As the event has ended I am providing the admin password so you can check everything how it works. It is 'admin123'. The event is basically answering the 20 questions. Each question is assigned a unique QR code. To answer the question you need to scan the QR code. The QR codes are pasted in 20 secret places in the college which have the coordinates on the map which is given to the team while the event starts. When a team registers in the backend the request is sent to admin which he must approve to join the event and after approving each team is assigned a unique sequence of 20 questions and a team number is given in the serial order of request approval. When event starts the first coordinates of the question is given to every team as per their sequence. The team had to search for QR code in that place and scan it and should give correct answer to get a 4 digit code. The team should login and go to the coordinate finder and add this 4 digit code to their team number at front and enter that 6 digit code to get the coordinates of next question. The team with highest no of questions and less time wins. The admin can view live leaderboard and time log of recent question answered. The admin can set the time of the competition. The reset button will remove all data and make it ready for next hunt. The page link is https://leelagunavardhan.github.io/Night-Sky-Hunt-Web/ . To update your changes in a realtime database change your credentials in script.js in the first few lines.
(const firebaseConfig = {
    apiKey: "AIzaSyCyVBia-bsTSwZSmGrztGGeyGvbk-3vGUM",
    authDomain: "night-sky-hunt-af24d.firebaseapp.com",
    databaseURL: "https://night-sky-hunt-af24d-default-rtdb.firebaseio.com",
    projectId: "night-sky-hunt-af24d",
    storageBucket: "night-sky-hunt-af24d.appspot.com",
    messagingSenderId: "649615581460",
    appId: "1:649615581460:web:13d2c0d15161e1ef43e201",
    measurementId: "G-YBD7B53TJJ"
};)
Change these credentials to yours by creating your own database in Firebase console as i am closing my api in my account.

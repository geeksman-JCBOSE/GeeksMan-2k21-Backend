<hr>
<h1>GeeksMan</h1>
An online platform for organising mcq based tests.
<hr>

## About
Geeksman is the Contest Website of Geeksman the official Coding club of CE Department of JC Bose University of Science and Technology, developed by members of Geeksman. We are a team of 50+ students. The website is loved by everyone for conductiong contests.

## Main functionalities
* Lists all the upcoming ,ongoing and past contests.
* Students can register for the contest and time for their slot is sent via an email.
* Support feature is also there if a student have any doubt they can use it to contact the admins.
* Users can check their past given contests and their marks and rank in that respective contest and can also update their profile.
* If user forgot their password they can reset it using forgot password.

## Technology stack and platforms used
### For Backend
* Express
* mongodb
* Nginx
* docker
* Redis
* socket.io
* cloudinary
* Jest
* Npm packages 
* Azure
* Mongodb Atlas

### For Frontend
* Axios
* React
* Redux
* Material-ui
* Npm packages
* Netlify

## Try it out on
 [geeksman](https://geeksmanjcbust.in)


## Upcoming updates
* Hosting coding contests 
* Chat bot 
* security improvements
* Testing using jest 
* Container orchestrator

## Installation Guide
# To setup the backend using docker :-
* Install docker and docker-compose on your machine
* Add an env file name dev.env inside the config folder with the env variables shown in example.env
* Type the following command to run the development docker container
* sudo docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# To setup the backend on host from source code
* Add an env file name dev.env inside the config folder with the env variables shown in example.env
* Type the following command to start the server
* npm run dev

# To setup the frontend on host from source code
* First install node modules inside the frontend folder using npm i command
* Type the following command to start the local development server
* npm start

## Communication
Feel free to discuss email us at cedept@geeksmanjcbust.in
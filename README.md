# ExCerebrum

*ExCerebrum* in latin means "of brain" and the meaning of the name is that the moves as well as the bot itself are developed
with great mind.

ExCerebrum is a chess bot that plays on [Lichess.org](https://lichess.org). Profile of original bot (no forked or cloned versions of other users) is
[ExCerebrum](https://lichess.org/@/excerebrum), the Lichess profile of the developer, me, is [Makedonium](https://lichess.org/@/Makedonium).

## Idea behind the project

I started this project because I wanted to learn Node for quite a while but I did not have any interesting project to work on.
Since I enjoy playing chess on regular basis for fun, I started researching how Lichess bots play. When I learned that they
communicate through API, the idea arouse. I knew in exact moment that this will be my first Node project, and that it should
provide a good learning curve.

## Chess engine

Currently, chess engine is still in development phase and it plays random legal moves. The point of this is to first develop
communication with Lichess, handling of events and legal move generation fully functional.

## Setup

First, you need to clone the repository.

```shell script
git clone https://github.com/campovski/ex-cerebrum
```

Next, copy */app/.env.example* into */app/.env* and fill in the required information.

 - `LICHESS_TOKEN` is the API token of the bot. See [official Lichess API documentation](https://lichess.org/api) to see
 how to acquire the API token.
 - `NODE_ENV` is the Node environment. It allows multiple configurations but since we do not have any configuration, we
 can delete this field.
 - `PORT` is the port on which the server will run. For just using the bot and play via Lichess, a default value of 3000
 will be used if `PORT` is left unspecified. If you for some reason need to change the port, e.g. to allow connections from outside
 on certain port, specify the desired port here.
 
Once done with the environment variables, you can now run `bash setup.sh` script which will run on Debian/Ubuntu. It installs
Node and required dependencies. This script will also build the frontend files and run the server.

*If you are on other hosts, please check the [official Node website](https://nodejs.org/) on
how to install Node for your system.*

## Contributing

Since the project is still in developmental phase and its future is unknown, I currently do not accept contributions from
other developers. For any comments and suggestions, please open an issue, however your own pull requests will most likely
not be merged, because for now I want to keep this as my project and my project only :).

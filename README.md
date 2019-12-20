# ExCerebrum

*ExCerebrum* in latin means "of brain" and the meaning of the name is that the moves as well as the bot itself are developed
with great mind.

ExCerebrum is a chess bot that plays on [Lichess.org](https://lichess.org). It only (for now) plays the standard chess, no variants.
Profile of original bot (no forked or cloned versions of other users) is [ExCerebrum](https://lichess.org/@/excerebrum),
and the Lichess profile of the developer, me, is [Makedonium](https://lichess.org/@/Makedonium).

## Idea behind the project

I started this project because I wanted to learn Node for quite a while but I did not have any interesting project to work on.
Since I enjoy playing chess on regular basis for fun, I started researching how Lichess bots play. When I learned that they
communicate through API, the idea arouse. I knew in exact moment that this will be my first Node project, and that it should
provide a good learning curve.

## Chess engine

Currently, chess engine is still in development phase and it plays random legal moves. The point of this is to first develop
communication with Lichess, handling of events and legal move generation fully functional.

## Plan for future

At the start I will start on implementing a chess engine. This will be a long and tedious, yet fun and challenging, process.
When this will be done, a bot will constantly run on my home server and players will be able to challenge it at any time.

After this, I will most probably move to developing support for certain variants, first those that look the most like standard
Chess, e.g. *King of the Hill* and *Antichess*. Variants like *Atomic* or *Racing Kings* would require to implement a different
game logic (other legal moves in *RK* or exploding pieces in *Atomic* for example). In few years time, I hope I will support
all of the variants. Yes, in few years, I have a lot of other work to do as well ;).

Then, the frontend will come in plan, probably, maybe... The idea is that the bot would have its own website, however it might
happen that this will be just a really basic website, just so that I still need webpack and can learn something new about it.  

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

#!/bin/bash

INSTALL_NODE=1
INSTALL_DEPENDENCIES=1

for i in "$@"
do
  case $i in
    --no-node)
      INSTALL_NODE=0;;
    --no-dependency)
      INSTALL_DEPENDENCIES=0;;
    --no-install)
      INSTALL_NODE=0
      INSTALL_DEPENDENCIES=0;;
  esac
done

if [ $INSTALL_NODE -eq 1 ]
then
  echo "Installing NodeJS ..."

  sudo apt install -y nodejs
  if [ $? -eq 0 ]
  then
    printf "\n"
    printf "  \e[48;5;046m                                            \e[0m\n"
    printf "  \e[48;5;046m  NodeJS successfully installed!            \e[0m\n"
    printf "  \e[48;5;046m                                            \e[0m\n"
    printf "\n"
  else
    printf "\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "  \e[48;5;196m  An error occured while installing NodeJS  \e[0m\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "\n"
    return
  fi
else
  printf "Skipping NodeJS installation."
fi

if [ $INSTALL_DEPENDENCIES -eq 1 ]
then
  echo "Installing dependencies ..."

  NODE_VERSION=$(nodejs -v)
  if [ $? -ne 0 ]
  then
    printf "\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "  \e[48;5;196m  ERROR: You do not have NodeJS installed!  \e[0m\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "\n"
    return
  fi

  NPM_VERSION=$(npm -v)
  if [ $? -ne 0 ]
  then
    printf "\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "  \e[48;5;196m  ERROR: You do not have npm installed!     \e[0m\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "\n"
    return
  fi

  npm install
  if [ $? -eq 0 ]
  then
    printf "\n"
    printf "  \e[48;5;046m                                            \e[0m\n"
    printf "  \e[48;5;046m  NPM dependencies successfully installed!  \e[0m\n"
    printf "  \e[48;5;046m                                            \e[0m\n"
    printf "\n"
  else
    printf "\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "  \e[48;5;196m  An error occured while installing         \e[0m\n"
    printf "  \e[48;5;196m  dependencies! See output above.           \e[0m\n"
    printf "  \e[48;5;196m                                            \e[0m\n"
    printf "\n"
    return
  fi
fi

npm run build

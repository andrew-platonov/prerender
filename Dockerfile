FROM ubuntu:22.04

RUN apt-get -y update && \
    apt-get -y upgrade
RUN apt-get -y install wget && \
    apt-get -y install nodejs && \
    apt-get -y install npm
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - 
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get -y update
RUN apt-get -y install google-chrome-stable


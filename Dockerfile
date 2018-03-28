FROM node:4.8.7

MAINTAINER PRX <sysadmin@prx.org>
LABEL org.prx.app="yes"

ENV APP_HOME /app
ENV PHANTOM true
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 4200

ADD . ./
RUN npm install --no-optional --ignore-scripts --loglevel error
RUN npm run postinstall

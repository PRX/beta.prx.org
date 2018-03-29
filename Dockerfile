FROM node:4.8.7

MAINTAINER PRX <sysadmin@prx.org>
LABEL org.prx.app="yes"

ENV PHANTOM true
ENV APP_HOME /app
ENV HOME=$APP_HOME
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 8080

ENTRYPOINT [ "/usr/local/bin/npm" ]
CMD [ "run", "start" ]

ADD . ./
RUN chown -R node:node $APP_HOME
USER node

RUN npm install
RUN npm run compile

FROM node:4.8.7

MAINTAINER PRX <sysadmin@prx.org>
LABEL org.prx.s3static="true"
LABEL org.prx.spire.publish.s3="LAMBDA_ZIP"

ENV PHANTOM true
ENV APP_HOME /app
ENV HOME=$APP_HOME
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 8080

RUN apt-get update && apt-get install -y zip

ENTRYPOINT [ "/usr/local/bin/npm" ]
CMD [ "run", "start" ]

ADD . ./
RUN chown -R node:node $APP_HOME
USER node

RUN yarn install --ignore-engines
RUN npm run compile
RUN npm run zip

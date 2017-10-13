#!/usr/bin/env bash
docker-compose rm -f
docker rmi wurstmeister/zookeeper
docker rmi wurstmeister/kafka:0.10.2.1
docker rmi prom/prometheus
docker rmi prom/pushgateway

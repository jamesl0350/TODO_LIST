## LOCAL

docker pull mysql/mysql-server:8.0.28
docker run --name project -e MYSQL_ROOT_PASSWORD=secret -d mysql --expose 3306

should use docker-compose instead

## TODO

docker run --name=project -d mysql/mysql-server:latest
docker logs project
4z4Is^202gfSrz5+K8x;sbOb:1%_EU@
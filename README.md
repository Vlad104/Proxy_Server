* sudo apt update
* sudo apt install -y mongodb
* sudo apt-get install -y nodejs
* sudo apt-get install -y npm
* npm install
* service mongodb start
* sudo npm start

 HTTP сервер запускается на 80 порту, HTTPS на 443

 Запросы сохраняются в MongoDB. 
 Для отправки сохраненного запроса имеется минималистичный интерфейс:
* Выводим список id всех сохраненных запросов: localhost?id=all
* Команда для поторения запроса по его id - localhost?id={id}
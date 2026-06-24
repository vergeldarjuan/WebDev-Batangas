FROM php:8.4-apache

RUN docker-php-ext-install pdo_mysql
COPY apache/api-alias.conf /etc/apache2/conf-available/api-alias.conf
RUN a2enconf api-alias

WORKDIR /var/www/html

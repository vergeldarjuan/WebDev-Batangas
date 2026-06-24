FROM php:8.4-apache

RUN docker-php-ext-install pdo_mysql
COPY apache/api-alias.conf /etc/apache2/conf-available/api-alias.conf
COPY uploads /var/www/uploads
RUN mkdir -p /var/www/uploads/listings \
    && chown -R www-data:www-data /var/www/uploads \
    && chmod -R 775 /var/www/uploads
RUN a2enconf api-alias

WORKDIR /var/www/html

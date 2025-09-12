FROM nginx:1.24-alpine

# Elimina la conf por defecto
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

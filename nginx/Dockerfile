FROM nginx:1.24-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/ /etc/nginx/certs/

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

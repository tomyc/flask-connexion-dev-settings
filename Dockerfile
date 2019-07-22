FROM tiangolo/uwsgi-nginx-flask:python3.6

COPY ./requirements.txt /app/requirements.txt
COPY ./uwsgi.ini /app/uwsgi.ini
COPY ./static/ /app/static/
COPY ./templates /app/templates
COPY ./*.py /app/
COPY ./settings.db /app/room.db
COPY ./swagger.yml /app/swagger.yml

WORKDIR /app

RUN pip install -r requirements.txt

COPY . ../

CMD python app.py


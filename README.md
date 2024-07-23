To run on localhost:
1.Discomment #DB_HOST=localhost in .env
2.Comment DB_HOST=db in .env
3.Write: npm run start:dev

To run in Docker container:
1.State .env without changes
2.Write: docker-compose up --build

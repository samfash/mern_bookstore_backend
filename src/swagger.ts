import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN API Documentation",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts"], // Path to route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default (app: any) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
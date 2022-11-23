//Middlewares Currently not in use
app.use(morgan("combined", { stream: accessLogStream })); //This will log in a file (calling accesLogStream) and using Morgan to log the client request
app.use(express.static("public")); ////This allows using the express static resources exposed to avoid calling them one by one
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
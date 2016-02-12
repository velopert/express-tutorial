module.exports = function(app, fs)
{
    var userjsonDir = __dirname + "/../data/user.json";
    
     app.get('/',function(req,res){
         var sess = req.session;

         res.render('index', {
             title: "MY HOMEPAGE",
             length: 5,
             name: sess.name,
             username: sess.username
         })
     });

    app.get('/list', function (req, res) {
        
        fs.readFile( userjsonDir, 'utf8', function (err, data) {
           res.end( data );
       });
    });

    app.get('/getUser/:username', function(req, res){
       fs.readFile(userjsonDir, 'utf8', function (err, data) {
            var users = JSON.parse(data);
            res.json(users[req.params.username]);
       });
    });

    app.post('/addUser/:username', function(req, res){
        
        var result = {  };
        var username = req.params.username;

        // CHECK REQ VALIDITY
        if(!req.body["password"] || !req.body["name"]){
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        // LOAD DATA & CHECK DUPLICATION   
        fs.readFile(userjsonDir, 'utf8',  function(err, data){
            var users = JSON.parse(data);
            if(users[username]){
                // DUPLICATION FOUND
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // ADD TO DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(userjsonDir, 
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });

    
    app.put('/updateUser/:username', function(req, res){
        
        var result = {  };
        var username = req.params.username;

        // CHECK REQ VALIDITY
        if(!req.body["password"] || !req.body["name"]){
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        // LOAD DATA   
        fs.readFile(userjsonDir, 'utf8',  function(err, data){
            var users = JSON.parse(data);
            // ADD/MODIFY DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(userjsonDir, 
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });


    app.delete('/deleteUser/:username', function(req, res){
        var result = { };
        //LOAD DATA
        fs.readFile(userjsonDir, "utf8", function(err, data){
            var users = JSON.parse(data);
            
            // IF NOT FOUND
            if(!users[req.params.username]){
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }

            // DELETE FROM DATA
            delete users[req.params.username];
            
            // SAVE FILE
            fs.writeFile(userjsonDir,
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result["success"] = 1;
                res.json(result);
                return;
            })
        })

    });

    app.get('/login/:username/:password', function(req, res){
        var sess;
        sess = req.session;

        fs.readFile(userjsonDir, "utf8", function(err, data){
            var users = JSON.parse(data);
            var username = req.params.username;
            var password = req.params.password;
            var result = {};
            if(!users[username]){
                // USERNAME NOT FOUND
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }     

            if(users[username]["password"] == password){
                result["success"] = 1;
                sess.username = username;
                sess.name = users[username]["name"];
                res.json(result);
            
            }else{
                result["success"] = 0;
                result["error"] = "incorrect";
                res.json(result);
            }
        })
    });

    app.get('/logout', function(req, res){
        sess = req.session;
        if(sess.username){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    })
}

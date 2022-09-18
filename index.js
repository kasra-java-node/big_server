

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const io = new Server(server);
var crypto = require('crypto');

var mysql = require('mysql');

var con = mysql.createConnection({

  host: "bzd4myhjzeetabtuetly-mysql.services.clever-cloud.com",
  user: "uc6ope4zm8uyzlpj",
  password: "ZGPZIlaNAUQA8TCcBRys",
  port: 3306,
  database: "bzd4myhjzeetabtuetly"

});

con.connect(function(err) {
  if (err) throw err;

  //console.log("Connected!");

});

var image_profile = "https://s6.uupload.ir/files/icon_defult_0rl5.jpg"

var image_save = "https://s6.uupload.ir/files/save_icon_alf9.png"

var image_group = "https://s6.uupload.ir/files/icon_group_j8p3.png"

var image_channel = "https://s6.uupload.ir/files/icon_q897.png"

var image_bot = "https://s6.uupload.ir/files/icon_bot_vi58.png"

var port = 8000

app.get('/', (req, res) => {

    res.send('server running on port ' + port);

});

io.on('connection', function(socket){

    console.log('a user is connected ' + socket.id);

    var message_connect = 'Chillchat'

    socket.emit('connect_name', {key_connect:message_connect} );

    socket.on('singup', function(name, username, password){

      var chats_list = "no"

      con.query('INSERT INTO users (name,username,password,chats) VALUES (?,?,?,?) ' , [name , username , password , chats_list ] , function (err, result) {
        
        if (err) {

          var message_primary = 'Username already exists !'
          
          socket.emit('primary', {message_error:message_primary} );

        } else {

          var message_successful = 'Registration was successful ✅'
          
          socket.emit('successful', {message_ok: message_successful, message_chat: chats_list } );

          con.query('INSERT INTO save_message (chat_name,id_user) VALUES (?,?) ' , ['Saved Message' , username] , function (err, result) {

          });

          con.query('INSERT INTO channel_news (chat_name,id_user) VALUES (?,?) ' , ['Chillchat News' , username] , function (err, result) {

          });

          con.query('INSERT INTO bots (chat_name,id_user) VALUES (?,?) ' , ['Mr.Friend' , username]  , function (err, result) {

          });

        }

      });    

  });

  socket.on('login', function(username, password) {

    con.query("SELECT name,chats FROM users WHERE username = '"+username+"' AND password = '"+password+"' " , function (err, result) {

      if (result.length == 0) {

        var message_error = 'The username or password is incorrect !'
        
        socket.emit('error_username', {error_key:message_error} );

      } else {

        var message_ok = 'Login was successful ✅'

        Object.keys(result).forEach(function(key) {

          var row = result[key];

          socket.emit('ok_username', {ok_key:row.name , chats_key:row.chats} );


        });

      }

    });

  });

  socket.on('send_message_group' , function(id_messages, id_group ,type, message, user, name, img, time) {

    if (id_messages.length == 0) {

      var id_messages = id_group + type + message + time + user + crypto.randomBytes(25).toString('hex') ;

    } else {

    }

    con.query('INSERT INTO group_messages (id_group,id_message,type_message,message,id_sender_message,name_sender,img_sender,time_sender) VALUES (?,?,?,?,?,?,?,?) ' , [id_group, id_messages, type, message, user, name, img, time] , function (err, result) {
      
      io.emit('sended_message_group' ,  { send_id_messages: id_messages , send_id_group: id_group , send_type: type , send_message: message , send_user: user , send_name: name , send_img: img , send_time: time } );

    });
    
  });

  socket.on('select_details_user', function(username) {

    con.query("SELECT name,image,tag FROM users WHERE username = '"+username+"' " , function (err, result) {

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('send_details_user', { name_user: row.name , image_user: row.image , tag_user: row.tag } );

      })

    });

  });

  socket.on('update_details_user', function(name,old_username,username,image,bio,tag,password) {
    
    con.query("UPDATE users SET name = '"+name+"' , username =  '"+username+"' , password = '"+password+"' , image = '"+image+"' , bio = '"+bio+"' , tag = '"+tag+"'  WHERE username = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE save_message SET id_user = '"+username+"' WHERE id_user = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE group_messages SET id_sender_message = '"+username+"' , name_sender = '"+name+"' , img_sender = '"+image+"'  WHERE id_sender_message = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE group_members SET id_user = '"+username+"' WHERE id_user = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE group_chats SET user_create = '"+username+"' WHERE user_create = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE channel_news SET id_user = '"+username+"' WHERE id_user = '"+old_username+"' " , function (err, result) {

    });

    con.query("UPDATE bots SET id_user = '"+username+"' WHERE id_user = '"+old_username+"' " , function (err, result) {

    });
    
    socket.emit('updated_details_user', { message_update: "update"  } );
    
  });

  socket.on('select_profile_user', function(username) {

    con.query("SELECT name,username,password,image,bio,tag FROM users WHERE username = '"+username+"' " , function (err, result) {

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('selected_profile_user', { 
          
        my_image: row.image , my_name: row.name , my_username: row.username , my_bio: row.bio , my_tag: row.tag , my_pass: row.password } );

      })

    });

  });

  socket.on('set_status' , function(id,status) {

    con.query("UPDATE group_members SET status = '"+status+"' WHERE id_user = '"+id+"' " , function (err, result) {

    });

  });

  socket.on("read_details_group" , function(id_group) {

    con.query("SELECT name_group,id_group,image,user_create,time FROM group_chats WHERE id_group = '"+id_group+"' " , function (err, result) {

      if (result.length == 0) {


      } else {

        Object.keys(result).forEach(function(key) {

          var row = result[key];
          
          var name = row.name_group;
          var username = row.id_group;
          var image = row.image;
          var user_create = row.user_create;
          var time = row.time;
          
          socket.emit("read_details_grouped", { message_name_group: name , message_username_group: username , message_image_group: image , message_user_create_group: user_create , message_time_group: time } );
      

        })
        
      }

    });
    
  });

  socket.on("read_list_chats" , function(id_group) {

    con.query("SELECT * FROM group_messages WHERE id_group = '"+id_group+"' " , function (err, result) {

      if (result.length == 0) {


      } else {

        Object.keys(result).forEach(function(key) {

          var row = result[key];
          
          var group = row.id_group;
          var id_message = row.id_message;
          var type = row.type_message;
          var message = row.message;
          var id_sender_message = row.id_sender_message;
          var name_sender = row.name_sender;
          var img_sender = row.img_sender;
          var time_sender = row.time_sender;

          socket.emit("read_list_chated", { id_group_list: group , id_message_list: id_message , type_list: type , message_list: message , id_sender_message_list: id_sender_message , name_sender_list: name_sender , img_sender_list: img_sender , time_sender_list: time_sender } );
    
        });
      }

    });
    
  });

  socket.on('check_id_private_group', function(data) {

    var id = "chillchat~group?!://" + crypto.randomBytes(20).toString('hex') ;
    
    con.query("SELECT id_group FROM group_chats WHERE id_group = '"+id+"' " , function (err, result) {

      if (result.length == 0) {

        socket.emit("checked_id_private_group", {message_id: id} );

      } else {

        var id2 = "chillchat~group?!://" + crypto.randomBytes(21).toString('hex') ;

        socket.emit("checked_id_private_group", {message_id: id2} );

      }

    });
  
  });

  socket.on('check_id_group_public', function(id) {

    con.query("SELECT id_group FROM group_chats WHERE id_group = '"+id+"' " , function (err, result) {

      if (result.length == 0) {

        socket.emit("checked_id_public_group", {result_id: id} );

      } else {

        socket.emit("checked_id_public_group", {result_id: 'id already exists'} );

      }

    });
    
  });


  socket.on('show_save_message', function(username, time) {

    con.query("SELECT id,chat_name,id_user,image FROM save_message WHERE id_user = '"+username+"' " , function (err, result) {

      var message = 'Saved Message'

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('show_saved_message', { message_id: row.id , message_text: message , message_time: time , profile_img: row.image } );

      })
      
    });

});

  socket.on('check_select_username', function(username_one,username_two) {

    con.query("SELECT user_one,user_two FROM private_chats WHERE user_one = '"+username_one+"' AND user_two = '"+username_two+"' " , function (err, result) {

      if (result.length == 0) {

        con.query("SELECT name,username,image,bio,tag FROM users WHERE username = '"+username_two+"' " , function (err, result) {

          if (result.length == 0) {
            
            socket.emit("null_select_user", {message_null:"no user found"} );
        
        } else {

          Object.keys(result).forEach(function(key) {

            var row = result[key];

            var name = row.name;
            var username = row.username;
            var image = row.image;
            var bio = row.bio;
            var tag = row.tag;
          
            socket.emit("ok_select_user", {message_user_name:name , message_username:username  , message_user_image:image , message_user_bio:bio , message_user_tag:tag  } );
        

          })
          
        }

      });
      
      } else {
        
        socket.emit("null_select_user", {message_null:"have a chat"} );
      
      }

    });

  });

  socket.on('create_private_message', function(username_one,username_two) {

    con.query("INSERT INTO private_chats (user_one,user_two) VALUES (?,?) " , [username_one , username_two], function (err, result) {

      socket.emit('created_private_message', { message_create: username_two } );

    });

  });

  socket.on('create_group_public', function(name_group,id_group,user_create,time) {

    con.query("INSERT INTO group_chats (name_group,id_group,user_create,time) VALUES ('"+name_group+"','"+id_group+"','"+user_create+"','"+time+"') " , function (err, result) {

      socket.emit('created_group_public', { name_created_group_public: name_group , id_created_group_public: id_group , img_created_group_public: image_group , user_created_group_public: user_create , time_group_public: time  } );

    });

  });

  socket.on('create_group_private', function(name_group,id_group,user_create,time) {

    con.query("INSERT INTO group_chats (name_group,id_group,user_create,time) VALUES ('"+name_group+"','"+id_group+"','"+user_create+"','"+time+"') " , function (err, result) {

      socket.emit('created_group_private', { name_created_group_private: name_group , id_created_group_private: id_group , img_created_group_private: image_group , user_created_group_private: user_create , time_group_private: time  } );

    });

  });

  socket.on('add_user_member' , function(id,username) {

    con.query('INSERT INTO group_members (id_group,id_user) VALUES (?,?) ' , [id, username] , function (err, result) {

      socket.emit('added_user_member', {message_add : 'added'} );

    });
    
  });

  socket.on('add_member_group' , function(id,username) {

    con.query('INSERT INTO group_members (id_group,id_user) VALUES (?,?) ' , [id, username] , function (err, result) {

      socket.emit('added_member_group', {message_adds : username} );

    });
    
  });

  socket.on("send_details_user2", function(username) {

    con.query("SELECT name,image FROM users WHERE username = '"+username+"' " , function (err, result) {

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('sended_details_user2', { message_user_two:username , message_name_usertwo:row.name , message_img_usertwo:row.image } );

      })

    });

  });

  socket.on('show_channel_news', function(username, time) {

    con.query("SELECT id,chat_name,id_user,image FROM channel_news WHERE id_user= '"+username+"' " , function (err, result) {

      var message = 'Chillchat News'

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('show_channeled_news', { message_id: row.id , message_text: message , message_time: time , profile_img: row.image } );

      })
      
    });

  });

  socket.on('show_bots', function(username, time) {

    con.query("SELECT id,chat_name,id_user,image FROM bots WHERE id_user= '"+username+"' " , function (err, result) {

      var message = 'Mr.Friend'

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('showed_bots', { message_id: row.id , message_text: message , message_time: time , profile_img: row.image } );

      })
      
    });

  });
  
  socket.on('connect_name_group' , function(id) {

    con.query("select count(id_group) from group_members where id_group = '"+id+"' ", function (err, result) {

      var resultArray = Object.values(JSON.parse(JSON.stringify(result[0])))

      socket.emit('connected_name_group', {message_member: resultArray[0]} ) ;

    })
    
  });

  socket.on("read_list_groups" , function(username) {

    con.query("select id_group from group_members where id_user = '"+username+"' ", function (err, result) {

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        socket.emit('readied_list_groups', { message_read: row.id_group } ) ;

      })

    });

  });

  socket.on('check_admin_group', function(id,username,type) {

    con.query("SELECT id_group,id_user,status_admin FROM group_members WHERE id_group = '"+id+"' AND id_user = '"+username+"'  " , function (err, result) {

      Object.keys(result).forEach(function(key) {

        var row = result[key];

        if (row.status_admin == 'is') {

          socket.emit('checked_admin_group', { message_admin: 'is admin' , message_type: type } );
  
        } else {
  
          socket.emit('checked_admin_group', { message_admin: 'is not admin' , message_type: type } );
  
        }

      })

    });
  
  });

  socket.on('status_group' , function(id) {

    con.query("select count(id_group) from group_members where id_group = '"+id+"' and status = '"+'online'+"' ", function (err, result) {

      var resultArray = Object.values(JSON.parse(JSON.stringify(result[0])))

      socket.emit('stated_group', { message_online: resultArray[0] } ) ;

    });
    
  });

  socket.on('check_username_add_member' , function (username , id_group) {

    con.query("SELECT id_group,id_user FROM group_members WHERE id_group= '"+id_group+"' AND id_user = '"+username+"' " , function (err, result) {

      if (result.length == 0) {

        con.query("SELECT name,username,image,bio,tag FROM users WHERE username = '"+username+"' " , function (err, result) {

          if (result.length == 0) {
            
            socket.emit("null_selected_user", {message_null:"no user found"} );
        
        } else {

          Object.keys(result).forEach(function(key) {

            var row = result[key];

            var name = row.name;
            var username = row.username;
            var image = row.image;
            var bio = row.bio;
            var tag = row.tag;
            
            socket.emit("checked_username_add_member", {message_user_name:name , message_username:username  , message_user_image:image , message_user_bio:bio , message_user_tag:tag  } );  

          })
        }

        });
      
      } else {
        
        socket.emit("null_selected_user", {message_null:"have added"} );
      
      }


    });

  });

  socket.on('show_typing', function(username, name, status) {
    
    io.emit('showed_typing', {message_username: username , message_name: name , message_status: status } );

  });

  socket.on('change_message_group', function(id_group, id_message, new_message, username) {
    
    con.query("UPDATE group_messages SET message = '"+new_message+"' WHERE id_group = '"+id_group+"' AND id_message = '"+id_message+"'   " , function (err, result) {

      io.emit('changed_message_group', { message_username: username  } );

    });
    
  });

  socket.on('delete_message_group', function(id_group, id_message, username) {

    con.query("DELETE FROM group_messages WHERE id_group = '"+id_group+"' AND id_message = '"+id_message+"' " , function (err, result) {

      io.emit('deleted_message_group', { message_username: username  } );

    });
    
  });
  
  socket.on('disconnect', function(id,status) {
      
    console.log('a user is disconnected !');

    var message_disconnect = 'Connecting to server'

    socket.emit('disconnect_name', {key_disconnect:message_disconnect} );
      
  });
});
  
server.listen(port, () => {

    console.log('server running on port ' + port);

});


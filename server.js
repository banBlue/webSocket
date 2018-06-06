const app = require('http').createServer(function(req,res){})
const io = require('socket.io')(app);

//连接数据库
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/M');

let userSchema = mongoose.Schema({
    password:{type:Number},
    name:{type:String}
},{timestamps:true});

let chat = mongoose.model('chat',userSchema);

app.listen(8000,()=>{console.log('开启成功')})

let users = 0;

let msg = [];

let cc = [];

io.on('connection', function (socket) {
    let userName = '';
    //注册
    socket.on('reg', function (data) {
        chat.create(data,function(err,user){
            if(err){
                socket.emit('reg_ret',{code:1,message:`输入有误${err}`})
            }else{
                socket.emit('reg_ret',{code:0,message:`老哥注册成功`})
            }
        })               
    });

    //登录
    socket.on('login', function (data) {

        chat.find(data,function(err,user){
            
            console.log(err,user)
            if(user.length==0){
                socket.emit('login_ret',{code:1,message:`输入有误${err}`})
            }else{ 
                userName = user[0].name
                socket.emit('login_ret',{code:0,message:`老哥登录成功`,userName})
                users++
            }
        })               
    });

    //离线
    socket.on('disconnect', function (data) {
        users--
        cc.push(socket)
        console.log('ccc',cc.length)
    })

    //接收消息
    socket.on('content',data=>{
        msg.push(data)
        socket.emit('content_ret',data)
        socket.broadcast.emit('server message', {
            msg: data
        });
    })

    setInterval(function(){
        socket.emit('man',users)
    },2000)

});
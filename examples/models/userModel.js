var mongoose=require('utils/mongoConnection');

var userSchema = new Schema({
    name:  String,
    email: String
});

var User = mongoose.model('User', userSchema);

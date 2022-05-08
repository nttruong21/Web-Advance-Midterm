module.exports = {
    multipleMongooseToObject: function (mongooseArray) {
        return mongooseArray.map((mongooseEle) => mongooseEle.toObject());
    },
    mongooseToObject: function (mongoose) {
        return mongoose ? mongoose.toObject() : mongoose;
    },
};

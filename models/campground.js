const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//'https://res.cloudinary.com/dn7otedur/image/upload/v1620808519/YelpCamp/vgqoeepusvcf5ckjs6rk.jpg'


ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');//when we add w_200 after upload it means to set the image to 200px
})
const opts = {toJSON:{virtuals:true}};
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts);


//this function is a middle that well trigger once we delete a campground. and deletes all the reviews 
// in case we dont have this function all the reviews will be orphaned and associated with a specific campground
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {// the id for each review 
                $in: doc.reviews // remove all the reviews that had id contains in this doc.reviews
            }
        })
    }
})

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong> <a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
})
module.exports = mongoose.model('Campground', CampgroundSchema);


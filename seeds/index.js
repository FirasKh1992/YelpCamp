const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6098153f3e0e01642c9b392f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Odit, quae eveniet! Qui accusantium tempore, placeat eum unde autem temporibus facere ut consequuntur voluptatem.Suscipit excepturi tempora voluptatum earum? Placeat, distinctio.',
            price,
            geometry:{
                type:"Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]

            },
            images: [
                {

                    url: 'https://res.cloudinary.com/dn7otedur/image/upload/v1620802832/YelpCamp/hmexverzk1thvkgvwvnz.jpg',
                    filename: 'YelpCamp/hmexverzk1thvkgvwvnz'
                },
                {

                    url: 'https://res.cloudinary.com/dn7otedur/image/upload/v1620802832/YelpCamp/xnbkrrv2ct8pu8iccd4g.jpg',
                    filename: 'YelpCamp/xnbkrrv2ct8pu8iccd4g'
                },
                {

                    url: 'https://res.cloudinary.com/dn7otedur/image/upload/v1620802832/YelpCamp/viueje9mkicmrzaq7tlb.jpg',
                    filename: 'YelpCamp/viueje9mkicmrzaq7tlb'
                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});

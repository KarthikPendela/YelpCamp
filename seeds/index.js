const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

 
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected!!");
});

const sample= array =>array[Math.floor(Math.random()*array.length)]

const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'5fe90d374bfab4373c206448',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            images:[
                {
                  url: 'https://res.cloudinary.com/dnynpzzcw/image/upload/v1611859699/YelpCamp/ojqzc7khpdrfs4cbaavn.jpg',
                  filename: 'YelpCamp/ojqzc7khpdrfs4cbaavn'
                },
                {
                  url: 'https://res.cloudinary.com/dnynpzzcw/image/upload/v1611859699/YelpCamp/m1prhimxbdqf1qcullw7.jpg',
                  filename: 'YelpCamp/m1prhimxbdqf1qcullw7'
                }
              ],
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil fuga voluptas natus cumque. Eum praesentium dolore eius minus earum quisquam error minima? Temporibus optio iusto impedit ad, eligendi ipsum minus.',
            price:price,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude,cities[random1000].latitude ] }
        })
        await camp.save();
    }
}

seedDB()
    .then(()=>{
        mongoose.connection.close();
    })
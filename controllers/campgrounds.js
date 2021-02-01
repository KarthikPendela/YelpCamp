const Campground=require('../models/campground');
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder= mbxGeocoding({accessToken:mapBoxToken});
const {cloudinary}=require('../cloudinary');

module.exports.index= async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campground/index',{campgrounds})
}

module.exports.renderCampgroundForm=(req,res)=>{
    res.render('campground/new')
}

module.exports.createCampgrounds=async (req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Details',400);
    const geoData= await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground= new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images=req.files.map(f=>({url: f.path, filename:f.filename}));
    campground.author=req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully Created a Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground=async (req,res)=>{
    const campground= await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    //console.log(campground);
    if(!campground)
    {
        req.flash('error','Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campground/show',{campground})
}

module.exports.renderEditForm=async (req,res)=>{
    const campground= await Campground.findById(req.params.id);
    if(!campground)
    {
        req.flash('error','Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campground/edit',{campground})
}

module.exports.editCampground=async (req,res)=>{
    const {id}=req.params;
    console.log(req.body);
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url: f.path, filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success','Successfully Updated a Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground=async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted a Campground');
    res.redirect('/campgrounds')
}
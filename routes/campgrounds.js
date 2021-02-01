const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground');
const campgrounds=require('../controllers/campgrounds');
const {isLoggedIn,validateCampground,isAuthor}=require('../middleware');
const multer=require('multer');
const {storage}=require('../cloudinary/index');
const upload=multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampgrounds));

router.get('/new',isLoggedIn,campgrounds.renderCampgroundForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn,catchAsync(campgrounds.deleteCampground));




router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm)); 

module.exports=router;
const User = require("../../model/VerifyData.js");
const {axios} = require("axios")
const { env } = require("process");
const { post } = require("request");
const { get } = require("request");
require("dotenv").config();

const handleVerifyData = async (req, res) => {
  try {
    const { idPhoto, livePhoto, photo } = req.body;
    if (!idPhoto || !livePhoto || !photo) return res.status(401).json({ message: "Image not found" });
     
    const { BlobServiceClient, ContainerClient } = require('@azure/storage-blob');

    async function storeImageInAzureBlobStorage(base64Image, containerName, blobName, imageType) {
        try {
            // Replace with your Azure Storage account connection string
            const connectionString = process.env.AZURE_CONNECTION;

            // Create a BlobServiceClient instance
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

            // Create a ContainerClient instance
            const containerClient = blobServiceClient.getContainerClient(containerName);

            // Create a BlockBlobClient instance
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            // Convert Base64 string to Buffer
            const buffer = Buffer.from(base64Image, 'base64');

            // Upload the image to Azure Blob Storage
            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    contentType: 'image/'+imageType // Replace with appropriate content type
                }
            });
            const imageUrl = blockBlobClient.url;
            
            console.log(imageUrl);

            console.log('Image uploaded successfully to Azure Blob Storage');
            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    // Example usage:
    const base64Image1 = req.body.idPhoto;
    const splitImageArray1 = base64Image1.split(".");
    const imageType1 = splitImageArray[-1];
    const idImage = storeImageInAzureBlobStorage(base64Image1, containerName, blobName, imageType1);

    const base64Image2 = req.body.photo;
    const splitImageArray2 = base64Image2.split(".");
    const imageType2 = splitImageArray2[-1];
    const randomImage = storeImageInAzureBlobStorage(base64Image2, containerName, blobName, imageType2);

    const livePhotoArray = req.body.livePhoto;
    const liveImages = [];
    for(let i=0; i<livePhotoArray.size(); i++){
        let base64Image = livePhotoArray[i];
        let splitImageArray = base64Image.split(".");
        let imageType = splitImageArray[-1];
        
        let imageUrl = storeImageInAzureBlobStorage(base64Image, containerName, blobName, imageType);
        liveImages[i] = imageUrl;
    }
    const containerName = process.env.AZURE_CONTAINER_NAME;
    const blobName = Date.now() +".png"
    console.log("Successfull");
    

    




const threshold = 0.8;
const apiUrlImageMatching = process.env.IMAGE_MATCHING_API_URL;
const apiKeyImageMatching = process.env.IMAGE_MATCHING_API_KEY;


async function imageMatching(imageUrl1, imageUrl2) {
    // call api to match image similarity 
    await axios.post(apiUrlImageMatching, {
        imageUrl1: imageUrl1,
        imageUrl2: imageUrl2
    }, {
        headers: {
            'x-api-key': apiKeyImageMatching
        }
    }).then((response) => {
        console.log(response.data);
        if (response.data.similarity > threshold) {
            console.log('Similar');
            return 'Similar';
        } else {
            console.log('Not Similar');
            return 'Not Similar';
        }
    }).catch((error) => {
        console.error(error);
    });
}


const apiUrlLivelinessDetection = process.env.LIVELINESS_DETECTION_API_URL;
const apiKeyLivelinessDetection = process.env.LIVELINESS_DETECTION_API_KEY;

async function livelinessDetection(imageUrl) {
    // call api to detect liveness
    await axios.post(apiUrlLivelinessDetection, {
        imageUrl: imageUrl
    }, {
        headers: {
            'x-api-key': apiKeyLivelinessDetection
        }
    }).then((response) => {
        console.log(response.data);
        if (response.data.liveliness === 'true') {
            console.log('Liveness Detected');
            return 'Liveness Detected';
        } else {
            console.log('Liveness Not Detected');
            return 'Liveness Not Detected';
        }
    });
}

const apiUrlKSimilarImages = process.env.K_SIMILAR_IMAGES_API_URL;
const apiKeyKSimilarImages = process.env.K_SIMILAR_IMAGES_API_KEY;


const k = 5;
async function getKSimilarImages(imageUrl, k) {
    // call api to get k similar images
    await axios.post(apiUrlKSimilarImages, {
        imageUrl: imageUrl,
        k: k
    }, {
        headers: {
            'x-api-key': apiKeyKSimilarImages
        }
    }).then(async (response) => {
        console.log(response.data);
        const imagePaths = response.data.similarImages;
        return imagePaths;
    });
}


async function checkKyC(idImageUrl,liveImageUrls,randomImageUrl) {

    try{
        // call livelinessDetection function
        const livelinessDetectionResponse =  await livelinessDetection(liveImageUrls);
        if (livelinessDetectionResponse === 'Liveness Not Detected') {
            console.log('Liveness Not Detected');
            return res.json({kycStatus: 'Failed', message: 'Liveness Not Detected'});
        }
        // call imageMatching function
        const imageMatchingResponse =  await imageMatching(idImageUrl, randomImageUrl);
        if (imageMatchingResponse === 'Not Similar') {
            console.log('Not Similar');
            return res.json({kycStatus: 'Failed', message: 'Id and live image not matched'});
        }
        // call getKSimilarImages function
        if(randomImageUrl === null){
            console.log('Random Image Url is null');
            return res.json({kycStatus: 'Success', message: 'You have successfully completed the KYC'});
        }
        // call getKSimilarImages function
        const getKSimilarImagesResponse =  await getKSimilarImages(randomImageUrl, k);
        return res.json({kycStatus: 'Success', message: 'You have successfully completed the KYC', kSimilarImages: getKSimilarImagesResponse});
    }
    catch(error){
        console.error(error);
    }
    


}


const verificationData = new Verification({
    user: userId, // Replace with actual user ID
    isVerified: 0,
    idPhoto: idImage,
    livePhoto: liveImges,
    photo: randomImage,
});

await verificationData.save();


if(response.data.kycStatus === 'Success'){
    await Verification.updateOne({isVerified: 1});
}



// const refreshTokenData = new Token({
//     user: userId,
//     refreshToken: refreshToken,
// });
// jwtToken.save();

// function login(userId, password) {
//     // check if user exists
//     const user
    
// }



// async function verifyJwt(jwtToken) {

// }
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = handleVerifyData;
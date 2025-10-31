const imageThumbnail = require('image-thumbnail');

const thumb = async () => {
	try {
    const thumbnail = await imageThumbnail('/9j/4AAQSkZJRgABAQEBLAEsAAD/4QEERXhpZgAA==');
    console.log(thumbnail);
} catch (err) {
    console.error(err);
}
};

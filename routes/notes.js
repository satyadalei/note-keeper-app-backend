const express = require("express"); //express - for performing route operation
const router = express.Router(); // requiring route for routing operation
const fetchUser = require("../middlewares/fetchuser"); // using fetchuser to authenticate legitimate user
const Notes = require("../models/Note"); // Note schema to perfome note operations
const { body, validationResult } = require("express-validator"); //using validator for note
const Note = require("../models/Note");
//::ROUTE:1:::++++++++++++++++++++++++  fetch all notes ++++++++++++++++++++++++
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    //const userId = req.userId ; // geting user id from fetchuser middleware
    const notes = await Notes.find({ userId: req.userId });
    res.send(notes);
});
//::ROUTE:2::: add a note ++++++++++++++++++++++++
router.post(
    "/addnote",
    fetchUser,
    [
        body("title", "Enter a valid title.").isLength({ min: 3 }),
        body("description", "Enter a valid description.").isLength({ min: 3 }),
    ],
    async (req, res) => {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            try {
                const note = new Note({
                    title,
                    description,
                    tag,
                    userId: req.userId,
                });
                const savedNote = await note.save();
                res.json(savedNote);
            } catch (error) {
                return res.status(500).json({ message: "Something gone wrong" });
            }
        }
    }
);
//::ROUTE:3:::++++++++++++++++++++++++  update a note ++++++++++++++++++++++++
router.put("/updatenote/:id", fetchUser, async (req, res) => {
    try {
        
    const noteId = req.params.id;
    const userId = req.userId;
    const { title, description, tag } = req.body;
    // first check whether note exist or not
    const foundNote = await Notes.findById(noteId);
    if (!foundNote) {
        // note not found
        res.send("sei note ama pakhare nahni!!");
    } else {
        //note found
        // check whether that note is particularly corresponding users note
        if (foundNote.userId.toString() === userId) {
            //foundNote.userId returns like --> new ObjectId("6438f02ebec761aa5a95738f") You have convert it to string to return something like --> "6438f02ebec761aa5a95738f"
            //user is authorized to modify note
            const modifiedNote = {};
            if (title) {
                modifiedNote.title = title;
            }
            if (description) {
                modifiedNote.description = description;
            }
            if (tag) {
                modifiedNote.tag = tag;
            }

            //find that note and update it
            const note = await Notes.findByIdAndUpdate(
                noteId,
                { $set: modifiedNote },
                { new: true }
            );
            res.json(note);
        } else {
            //user is not authorized to modify note
            res.send("Not allowed to modify");
        }
    }

    } catch (error) {
        console.log(
            "There is an Internal server error!! We appologize for the inconvenience"
        );
    }
});
//::ROUTE:4:::++++++++++++++++++++++++  delete a notes ++++++++++++++++++++++++
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
    try {
        //first get noteId and userId
        const noteId = req.params.id; //get note id through params
        const userId = req.userId; // the user who is requestion the operation -- got from token
        // second check whether exist or note
        // const foundNote = await Notes.findOne({id:noteId}); <---- Dont use findOne
        const foundNote = await Notes.findById(noteId); //<--- rather use findById()
        if (!foundNote) {
            //note not found
            res.send("Note does not found");
        } else {
            // note found
            //third check whether that note belongs to that particular user

            if (foundNote.userId.toString() === userId) {
                // delete note by id
                const deletedNote = await Notes.findByIdAndDelete(noteId);
                res.json(deletedNote);
            } else {
                res.send("You are not allowed.");
            }
        }
    } catch (error) {
        console.log(
            "There is an Internal server error!! We appologize for the inconvenience"
        );
    }
});

module.exports = router;

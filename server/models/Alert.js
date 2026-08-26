import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        title: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low'
        },

        source: {
            type: String,
            default: 'ResQAI'
        },

        location: {
            lat: Number,
            lng: Number
        },

        recommendations: [
            {
                type: String
            }
        ],

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    'Alert',
    alertSchema
);
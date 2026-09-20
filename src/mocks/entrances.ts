import type { Entrance } from '../types/Entrance';

export const entrances: Entrance[] = [
    // =========================
    // BUDYNEK B
    // =========================

    {
        id: 1,
        buildingId: 2,
        code: 'B-1',

        x: 0.6152,
        y: 0.5307,

        direction: 'right',

        description: 'Wejście zachodnie',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '21:00',
    },

    {
        id: 2,
        buildingId: 2,
        code: 'B-2',

        x: 0.6685,
        y: 0.5201,

        direction: 'left',

        description: 'Wejście wschodnie 1',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '08:00',
        openUntil: '18:00',
    },

    {
        id: 3,
        buildingId: 2,
        code: 'B-3',

        x: 0.6685,
        y: 0.5488,

        direction: 'left',

        description: 'Wejście wschodnie 2',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: false,
        openFrom: '07:00',
        openUntil: '21:00',
    },

    // =========================
    // BUDYNEK A
    // =========================

    {
        id: 4,
        buildingId: 1,
        code: 'A-1',

        x: 0.8299,
        y: 0.5482,

        direction: 'right',

        description: 'Wejście lewe',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '06:30',
        openUntil: '22:00',
    },

    {
        id: 5,
        buildingId: 1,
        code: 'A-2',

        x: 0.8459,
        y: 0.5273,

        direction: 'down',

        description: 'Wejście górne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: false,
        openFrom: '08:00',
        openUntil: '16:00',
    },

    {
        id: 9,
        buildingId: 1,
        code: 'A-3',

        x: 0.8182,
        y: 0.5628,

        direction: 'down',

        description: 'Wejście boczne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '08:00',
        openUntil: '20:00',
    },

    // =========================
    // BUDYNEK G
    // =========================

    {
        id: 6,
        buildingId: 6,
        code: 'G-1',

        x: 0.5395,
        y: 0.7446,

        direction: 'left',

        description: 'Wejście górne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    {
        id: 7,
        buildingId: 6,
        code: 'G-2',

        x: 0.5401,
        y: 0.7653,

        direction: 'left',

        description: 'Wejście dolne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: false,
        openFrom: '07:00',
        openUntil: '17:00',
    },

    // =========================
    // BUDYNEK H
    // =========================

    {
        id: 8,
        buildingId: 7,
        code: 'H-1',

        x: 0.5611,
        y: 0.6892,

        direction: 'right',

        description: 'Wejście górne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    {
        id: 10,
        buildingId: 7,
        code: 'H-2',

        x: 0.5614,
        y: 0.7306,

        direction: 'right',

        description: 'Wejście dolne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: null,
        openFrom: null,
        openUntil: null,
    },

    // =========================
    // BUDYNEK C
    // =========================

    {
        id: 11,
        buildingId: 3,
        code: 'C-1',

        x: 0.5485,
        y: 0.5200,

        direction: 'down',

        description: 'Wejście górne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    {
        id: 12,
        buildingId: 3,
        code: 'C-2',

        x: 0.5974,
        y: 0.5511,

        direction: 'left',

        description: 'Wejście boczne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    {
        id: 13,
        buildingId: 3,
        code: 'C-3',

        x: 0.5493,
        y: 0.5971,

        direction: 'up',

        description: 'Wejście dolne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    // =========================
    // BUDYNEK D
    // =========================

    {
        id: 14,
        buildingId: 4,
        code: 'D-1',

        x: 0.6766,
        y: 0.4650,

        direction: 'right',

        description: 'Wejście główne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    // =========================
    // BUDYNEK E
    // =========================

    {
        id: 15,
        buildingId: 5,
        code: 'E-1',

        x: 0.3864,
        y: 0.3795,

        direction: 'left',

        description: 'Wejście główne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    // =========================
    // BUDYNEK M
    // =========================

    {
        id: 16,
        buildingId: 10,
        code: 'M-1',

        x: 0.4207,
        y: 0.5294,

        direction: 'left',

        description: 'Wejście boczne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    {
        id: 17,
        buildingId: 10,
        code: 'M-2',

        x: 0.4331,
        y: 0.5321,

        direction: 'down',

        description: 'Wejście dolne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '07:00',
        openUntil: '20:00',
    },

    // =========================
    // BUDYNEK L
    // =========================

    {
        id: 18,
        buildingId: 9,
        code: 'L-1',

        x: 0.1672,
        y: 0.2310,

        direction: 'right',

        description: 'Wejście górne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '08:00',
        openUntil: '18:00',
    },

    {
        id: 19,
        buildingId: 9,
        code: 'L-2',

        x: 0.1678,
        y: 0.2592,

        direction: 'right',

        description: 'Wejście dolne',

        accessibility: 'unknown',
        verificationStatus: 'unverified',

        isOpen: true,
        openFrom: '08:00',
        openUntil: '18:00',
    },
];
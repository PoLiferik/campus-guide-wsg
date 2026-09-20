export interface StudentAccount {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: string;
}

export interface StudentSession {
    id: number;
    name: string;
    email: string;
    role: 'student';
}

const STUDENTS_KEY =
    'campus-guide-students';

const SESSION_KEY =
    'campus-guide-student-session';

function readStudents(): StudentAccount[] {
    const saved =
        localStorage.getItem(
            STUDENTS_KEY
        );

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(
            saved
        ) as StudentAccount[];
    } catch {
        return [];
    }
}

function saveStudents(
    students: StudentAccount[]
) {
    localStorage.setItem(
        STUDENTS_KEY,
        JSON.stringify(students)
    );
}

export const studentAuthApi = {
    async register(
        name: string,
        email: string,
        password: string
    ): Promise<StudentSession> {
        const students =
            readStudents();

        const normalizedEmail =
            email.trim().toLowerCase();

        const exists =
            students.some(
                (student) =>
                    student.email
                        .toLowerCase() ===
                    normalizedEmail
            );

        if (exists) {
            throw new Error(
                'EMAIL_EXISTS'
            );
        }

        const nextId =
            students.length === 0
                ? 1
                : Math.max(
                ...students.map(
                    (student) =>
                        student.id
                )
            ) + 1;

        const account:
            StudentAccount = {
            id: nextId,

            name:
                name.trim(),

            email:
            normalizedEmail,

            password,

            createdAt:
                new Date()
                    .toISOString(),
        };

        students.push(account);

        saveStudents(students);

        const session:
            StudentSession = {
            id:
            account.id,

            name:
            account.name,

            email:
            account.email,

            role:
                'student',
        };

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

        return session;
    },

    async login(
        email: string,
        password: string
    ): Promise<StudentSession> {
        const normalizedEmail =
            email.trim().toLowerCase();

        const student =
            readStudents().find(
                (item) =>
                    item.email
                        .toLowerCase() ===
                    normalizedEmail &&
                    item.password ===
                    password
            );

        if (!student) {
            throw new Error(
                'INVALID_LOGIN'
            );
        }

        const session:
            StudentSession = {
            id:
            student.id,

            name:
            student.name,

            email:
            student.email,

            role:
                'student',
        };

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

        return session;
    },

    async getCurrentStudent():
        Promise<StudentSession | null> {

        const saved =
            localStorage.getItem(
                SESSION_KEY
            );

        if (!saved) {
            return null;
        }

        try {
            return JSON.parse(
                saved
            ) as StudentSession;
        } catch {
            return null;
        }
    },

    async logout() {
        localStorage.removeItem(
            SESSION_KEY
        );
    },
};
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('coverArt') as unknown as File
        const audioFile: File | null = data.get('audioFile') as unknown as File

        if (!file || !audioFile) {
            return NextResponse.json(
                { error: 'Missing required files' },
                { status: 400 }
            )
        }

        // Save Cover Art
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const coverPath = join(process.cwd(), 'public', 'uploads', file.name)
        await writeFile(coverPath, buffer)

        // Save Audio File
        const audioBytes = await audioFile.arrayBuffer()
        const audioBuffer = Buffer.from(audioBytes)
        const audioPath = join(process.cwd(), 'public', 'uploads', audioFile.name)
        await writeFile(audioPath, audioBuffer)

        // Log other form data
        const formDataObj: any = {}
        data.forEach((value, key) => {
            if (key !== 'coverArt' && key !== 'audioFile') {
                formDataObj[key] = value
            }
        })
        console.log('Upload metadata:', formDataObj)

        return NextResponse.json({
            success: true,
            coverUrl: `/uploads/${file.name}`,
            audioUrl: `/uploads/${audioFile.name}`
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        )
    }
}

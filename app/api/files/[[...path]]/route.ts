import { type NextRequest, NextResponse } from "next/server"

const EXTERNAL_API_URL = "https://resource.supersurvey.live/api/v1/files"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  const { searchParams } = new URL(request.url)

  // Construct the target URL
  const targetUrl = new URL(path ? `${EXTERNAL_API_URL}/${path.join("/")}` : EXTERNAL_API_URL)
  searchParams.forEach((value, key) => targetUrl.searchParams.append(key, value))

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy GET error:", error)
    return NextResponse.json({ error: "Failed to fetch from external API" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { searchParams } = new URL(request.url)

    const targetUrl = new URL(EXTERNAL_API_URL)
    searchParams.forEach((value, key) => targetUrl.searchParams.append(key, value))

    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy POST error:", error)
    return NextResponse.json({ error: "Failed to upload to external API" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  if (!path || path.length === 0) {
    return NextResponse.json({ error: "Filename required" }, { status: 400 })
  }

  const targetUrl = `${EXTERNAL_API_URL}/${path.join("/")}`

  try {
    const response = await fetch(targetUrl, {
      method: "DELETE",
    })

    if (response.ok) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json().catch(() => ({ error: "Delete failed" }))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete from external API" }, { status: 500 })
  }
}

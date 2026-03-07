import { type NextRequest, NextResponse } from "next/server"

const EXTERNAL_API_URL = "https://resource.supersurvey.live/api/v1/files"

/* ================= POST ================= */
/*
POST is used for:
1. Get images (pagination JSON)
2. Upload file (multipart/form-data)
*/

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")

    const { searchParams } = new URL(request.url)
    const targetUrl = new URL(EXTERNAL_API_URL)

    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value)
    })

    let response: Response

    /* ---------- Upload File ---------- */
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()

      response = await fetch(targetUrl.toString(), {
        method: "POST",
        body: formData,
      })
    }

    /* ---------- Get Images (Pagination) ---------- */
    else {
      const body = await request.json()

      response = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
    }

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Proxy POST error:", error)

    return NextResponse.json(
      { error: "Failed to send POST request to external API" },
      { status: 500 }
    )
  }
}

/* ================= DELETE ================= */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params

  if (!path || path.length === 0) {
    return NextResponse.json(
      { error: "Filename required" },
      { status: 400 }
    )
  }

  const targetUrl = `${EXTERNAL_API_URL}/${path.join("/")}`

  try {
    const response = await fetch(targetUrl, {
      method: "DELETE",
    })

    if (response.ok) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json().catch(() => ({
      error: "Delete failed",
    }))

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Proxy DELETE error:", error)

    return NextResponse.json(
      { error: "Failed to delete from external API" },
      { status: 500 }
    )
  }
}
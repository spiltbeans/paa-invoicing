import { NextRequest, NextResponse } from "next/server";
import { getSheetNames } from '@/modules/chart_utils';

export async function GET(request: NextRequest) {
	const data = await getSheetNames()

	console.log('triggered', data)
	if (data.status === 'OK') {
		return NextResponse.json({
			sheet_names: data.files
		})

	} else {
		return NextResponse.json(
			{ error: "Something went wrong collecting file names." },
			{ status: 500 }
		)
	}

}

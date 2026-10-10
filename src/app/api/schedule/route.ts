import { NextResponse } from "next/server";
import { simulationEngine } from "@/server/engine";

export async function GET() {
  try {
    if (!simulationEngine) {
      return NextResponse.json({ success: false, error: "Simulation Engine belum siap" }, { status: 500 });
    }
    await simulationEngine.init();
    const schedule = simulationEngine.getScheduleInfo();
    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startTime, endTime, autoSync, applyNow } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "startTime dan endTime wajib diisi (contoh: 17:00:00)" },
        { status: 400 }
      );
    }

    if (!simulationEngine) {
      return NextResponse.json({ success: false, error: "Simulation Engine belum siap" }, { status: 500 });
    }

    await simulationEngine.init();
    const updated = await simulationEngine.setSessionSchedule(
      startTime,
      endTime,
      autoSync !== undefined ? Boolean(autoSync) : true,
      applyNow !== undefined ? Boolean(applyNow) : true
    );

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

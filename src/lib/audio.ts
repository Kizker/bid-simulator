// Audio disabled (Silent mode)
class SoundFX {
  public setMuted(_muted: boolean) {}
  public getIsMuted(): boolean {
    return true;
  }
  public playTick() {}
  public playBidSuccess() {}
  public playOutbidWarning() {}
  public playAntiSnipingAlert() {}
  public playGong() {}
}

export const soundFX = new SoundFX();


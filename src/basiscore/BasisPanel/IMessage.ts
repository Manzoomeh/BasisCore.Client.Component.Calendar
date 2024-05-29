export default  interface Imessage {
    NotificationMessageMethod( Errorid: string,
      Lid: number,
      Type?: number,
      Message?: string
    ): Promise<void>;
  }
  


  
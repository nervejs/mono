declare module 'gettext-parser' {

    interface IGetTextParserResult {
        translations: any
    }

    interface IGetTextParserPO {
        parse: (input: string) => IGetTextParserResult;
    }


    // class GetTextParser {
    //
    //     static po: IGetTextParserPO;
    //
    // }

    const GetTextParser: {
        po: IGetTextParserPO;
    };

    export = GetTextParser;

}